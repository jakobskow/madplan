// Supabase Edge Function: import-meal
// Henter Instagram OpenGraph-data og parser opskriften med Claude.
//
// Kræver env secret i Supabase Dashboard:
//   ANTHROPIC_API_KEY=sk-ant-...

import { corsHeaders } from '../_shared/cors.ts'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

interface ParsedMeal {
  name: string
  category: 'morgenmad' | 'frokost' | 'aftensmad' | 'snack'
  description: string | null
  tags: string[]
}

async function fetchOpenGraph(url: string): Promise<{ title: string; description: string; image: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Madplan/1.0)',
    },
  })
  if (!res.ok) throw new Error(`Kunne ikke hente URL (${res.status})`)
  const html = await res.text()

  function getMeta(property: string): string {
    const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'))
    return match ? decodeHTMLEntities(match[1]) : ''
  }

  return {
    title: getMeta('og:title') || getMeta('twitter:title'),
    description: getMeta('og:description') || getMeta('twitter:description'),
    image: getMeta('og:image') || getMeta('twitter:image'),
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

async function parseMealWithClaude(text: string, apiKey: string): Promise<ParsedMeal> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: `Du er en madplan-assistent. Ud fra en Instagram-tekst om mad skal du returnere et JSON-objekt.
Regler:
- "name": Kort, præcist navn på retten (dansk hvis muligt). Max 50 tegn.
- "category": Én af: "morgenmad", "frokost", "aftensmad", "snack". Gæt ud fra kontekst.
- "description": Kort beskrivelse af retten og/eller vigtigste ingredienser. Max 200 tegn. Null hvis ikke relevant.
- "tags": Liste af 2-5 vigtigste ingredienser eller egenskaber (fx "kylling", "pasta", "vegetar"). Dansk, lowercase.
Svar KUN med rent JSON – ingen markdown, ingen forklaring.`,
      messages: [
        {
          role: 'user',
          content: `Instagram-tekst:\n\n${text.slice(0, 2000)}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API fejl: ${response.status} – ${err}`)
  }

  const data = await response.json()
  const content = data?.content?.[0]?.text ?? ''

  // Strip eventuel markdown code block
  const json = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(json) as ParsedMeal
  } catch {
    throw new Error(`Kunne ikke parse Claude-svar som JSON: ${content}`)
  }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY er ikke sat i Supabase secrets')

    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Mangler url i request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Hent OpenGraph metadata
    const og = await fetchOpenGraph(url)
    const textToParse = [og.title, og.description].filter(Boolean).join('\n\n')

    if (!textToParse.trim()) {
      return new Response(
        JSON.stringify({ error: 'Ingen tekst fundet på siden – er det et offentligt Instagram-opslag?' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse med Claude
    const meal = await parseMealWithClaude(textToParse, apiKey)

    return new Response(JSON.stringify({ ...meal, sourceUrl: url, sourceImage: og.image }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
