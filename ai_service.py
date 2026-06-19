import os
import logging
import requests

logger = logging.getLogger("release_notes_explorer")

# Endpoint for Google Gemini API (using gemini-2.5-flash as it is fast and efficient)
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# A collection of smart templates to fallback on if no GEMINI_API_KEY environment variable is configured
MOCK_TEMPLATES = {
    'summary': (
        "💡 **Developer Summary ({length})**\n\n"
        "• This BigQuery update introduces changes related to **{type}** on {date}.\n"
        "• Description: {excerpt}\n"
        "• Key takeaway: This feature improves efficiency by automating underlying operations, "
        "allowing teams to focus on query construction and optimization."
    ),
    'explanation_beginner': (
        "👶 **Beginner Explanation ({length})**\n\n"
        "Imagine you have a giant filing cabinet (BigQuery) and you want to search it quickly. "
        "Normally, you have to organize papers manually. With this update ({type}), "
        "BigQuery does the heavy lifting for you automatically, kind of like having a helper "
        "robot that sorts files as soon as you drop them in! \n\n"
        "This means you don't have to write complex scripts or execute manual steps to manage "
        "and search through your information."
    ),
    'explanation_tech': (
        "⚙️ **Deep Technical Details ({length})**\n\n"
        "• **Mechanism**: Implements automated background processes that trigger when mutations occur. "
        "Specifically, when mutations (INSERT, UPDATE, DELETE) hit target nodes, internal system triggers "
        "propagate and recalculate indices or metadata columns.\n"
        "• **Infrastructure**: Bypasses typical query queuing pools to ensure low processing latency. "
        "Features are generally available (GA) across all major cloud nodes.\n"
        "• **Protocols**: Uses standard GCP encryption standards at rest and in transit."
    ),
    'impact': (
        "📈 **System Impact Analysis ({length})**\n\n"
        "1. **Performance**: Reduces read latency by caching computed states, though there may be minor write-amplification during initial table load.\n"
        "2. **Cost**: Reduces compute slot consumption since operations are optimized natively rather than using manual user-space code query slots.\n"
        "3. **Architecture**: Decouples manual trigger layers, leading to simplified pipeline maintenance."
    ),
    'migration': (
        "🗺️ **Migration Suggestions ({length})**\n\n"
        "• **Step 1**: Identify active tables/views utilizing manual workarounds or external triggers.\n"
        "• **Step 2**: Test the native BigQuery feature in a staging dataset with production-like loads.\n"
        "• **Step 3**: Deprecate user-space scripts once validation checks confirm identical output schema.\n"
        "• **Step 4**: Monitor BigQuery billing history to confirm slots savings."
    ),
    'upgrade_checklist': (
        "✅ **Upgrade Checklist ({length})**\n\n"
        "[ ] Review IAM permissions for target BigQuery service accounts.\n"
        "[ ] Update Terraform / Infrastructure-as-Code modules to support the new attributes.\n"
        "[ ] Set up cost limits and budget alerts on the newly active datasets.\n"
        "[ ] Brief the engineering team on syntax changes."
    ),
    'breaking_warning': (
        "⚠️ **Breaking Change Warning ({length})**\n\n"
        "• **Assessment**: No explicit breaking changes are introduced by this release note. "
        "However, if you are migrating from manual cron-based triggers to native automation, "
        "ensure both do not run concurrently to avoid duplicate charges or conflicts.\n"
        "• **Compatibility**: Natively compatible with standard SQL specifications. Legacy SQL is unsupported."
    ),
    'tweet': (
        "📢 BigQuery Update ({date}): Automated processing for {type} is here! "
        "Simplify database pipelines and optimize query speeds natively. "
        "Check out details: {link} #GoogleCloud #BigQuery"
    ),
    'linkedin': (
        "👔 **LinkedIn Share Proposal ({length})**\n\n"
        "Google Cloud just announced a significant BigQuery update for {type} on {date}! 🚀\n\n"
        "As data warehouses scale, managing metadata and indexing manually becomes an operational bottleneck. "
        "By automating these pipelines natively, teams can reduce latency, trim slot compute costs, and focus on delivering core features.\n\n"
        "How is your team handling data automation? Check out the full update notes: {link}\n\n"
        "#GoogleCloud #BigQuery #DataEngineering #CloudInfrastructure"
    ),
    'blog': (
        "✍️ **Blog Draft Outline ({length})**\n\n"
        "**Title**: Modern Data Engineering: Streamlining BigQuery with Native {type} \n\n"
        "**Introduction**:\n"
        "Data volumes are exploding, demanding self-optimizing warehouses. GCP's newest release addresses this directly.\n\n"
        "**Technical Overview**:\n"
        "We discuss how this change handles data mutations under the hood, comparing old cron approaches with new native pipelines.\n\n"
        "**Key Benefits**:\n"
        "• Zero-maintenance scheduling.\n"
        "• Compute slot consumption savings.\n\n"
        "**Conclusion**:\n"
        "A checklist for getting started and migrating production environments."
    )
}

def generate_gemini_prompt(content, mode, length):
    """
    Constructs specific prompts for the Gemini API model based on the selected mode and length.
    """
    length_instruction = {
        'short': "in brief (maximum 3 bullet points, concise language)",
        'medium': "in a standard professional format (around 2-3 short paragraphs or clean lists)",
        'long': "in detailed depth (complete breakdown, full explanation, step-by-step)"
    }.get(length, 'medium')
    
    prompts = {
        'summary': (
            f"Provide a developer-focused summary of the following BigQuery release note. "
            f"Write the response {length_instruction}. Focus on actionable technical value. "
            f"Release note text:\n\n{content}"
        ),
        'explanation_beginner': (
            f"Explain the following BigQuery release note to a beginner software engineer. "
            f"Use simple analogies, avoid jargon, and write {length_instruction}. "
            f"Release note text:\n\n{content}"
        ),
        'explanation_tech': (
            f"Explain the deep technical mechanics, protocols, and architectural specifications "
            f"behind the feature described in this BigQuery release note. Write {length_instruction}. "
            f"Release note text:\n\n{content}"
        ),
        'impact': (
            f"Perform a system impact analysis on the following BigQuery release note. "
            f"Estimate performance implications, compute resource costs, and pipeline architecture impacts. "
            f"Write {length_instruction}. Release note text:\n\n{content}"
        ),
        'migration': (
            f"Outline migration recommendations and step-by-step suggestions for an engineering team "
            f"transitioning existing manual routines to the feature described in this BigQuery update. "
            f"Write {length_instruction}. Release note text:\n\n{content}"
        ),
        'upgrade_checklist': (
            f"Provide a clear checklist of tasks (using markdown checkboxes [ ]) that a database administrator "
            f"or cloud engineer must complete to enable/adopt the feature in this BigQuery release note. "
            f"Write {length_instruction}. Release note text:\n\n{content}"
        ),
        'breaking_warning': (
            f"Identify if there are any breaking changes, deprecation warnings, backwards compatibility issues, "
            f"or operational risks highlighted in this BigQuery release note. Focus on safety warnings "
            f"and write {length_instruction}. Release note text:\n\n{content}"
        ),
        'tweet': (
            f"Generate an engaging, professional tweet (max 280 characters) summarizing the key update "
            f"in this BigQuery release note. Do not exceed 280 characters total. Release note text:\n\n{content}"
        ),
        'linkedin': (
            f"Write an engaging LinkedIn post discussing the business and engineering value of the update "
            f"described in this BigQuery release note. Write {length_instruction}. Release note text:\n\n{content}"
        ),
        'blog': (
            f"Generate a technical blog post draft discussing the practical engineering applications "
            f"of the feature described in this BigQuery release note. Include section headings. "
            f"Write {length_instruction}. Release note text:\n\n{content}"
        )
    }
    
    return prompts.get(mode, prompts['summary'])

def get_ai_insight(note_content, date_str, type_str, link_url, mode='summary', length='medium'):
    """
    Connects to the Google Gemini API to analyze release notes.
    If GEMINI_API_KEY is not configured, gracefully falls back to structured templates
    so the dashboard remains fully functional for demonstration.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        logger.warning("GEMINI_API_KEY environment variable is missing. Serving structured mock insight.")
        template = MOCK_TEMPLATES.get(mode, MOCK_TEMPLATES['summary'])
        excerpt = note_content[:200] + "..." if len(note_content) > 200 else note_content
        
        mock_result = template.format(
            date=date_str,
            type=type_str,
            excerpt=excerpt,
            link=link_url or 'https://cloud.google.com/bigquery/docs/release-notes',
            length=length.upper()
        )
        return mock_result, "mock_fallback"
        
    # Setup request payload
    prompt = generate_gemini_prompt(note_content, mode, length)
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    params = {"key": api_key}
    
    try:
        logger.info(f"Dispatching query to Gemini API for mode: {mode}")
        response = requests.post(GEMINI_API_URL, params=params, json=payload, timeout=15)
        response.raise_for_status()
        
        result_json = response.json()
        
        # Parse Gemini API response structure
        candidates = result_json.get("candidates", [])
        if candidates:
            content_obj = candidates[0].get("content", {})
            parts = content_obj.get("parts", [])
            if parts:
                text_result = parts[0].get("text", "").strip()
                logger.info("Successfully received AI response from Gemini.")
                return text_result, "gemini_api"
                
        raise ValueError("Unexpected Gemini JSON payload layout")
        
    except Exception as err:
        logger.error(f"Failed to query Gemini API: {err}. Falling back to mock templates.")
        # Graceful degradation fallback on error
        template = MOCK_TEMPLATES.get(mode, MOCK_TEMPLATES['summary'])
        excerpt = note_content[:200] + "..." if len(note_content) > 200 else note_content
        mock_result = template.format(
            date=date_str,
            type=type_str,
            excerpt=excerpt,
            link=link_url or 'https://cloud.google.com/bigquery/docs/release-notes',
            length=length.upper()
        )
        return mock_result, f"error_fallback: {str(err)}"
