"""
Dynamic prompt builder for AI feedback
Builds prompts based on rubric settings, question type, and RAG context
"""
from typing import Dict, Any, Optional


def build_mcq_feedback_prompt(
    question_text: str,
    options: Dict[str, str],
    student_answer: str,
    correct_answer: str,
    is_correct: bool,
    rubric: Dict[str, Any],
    rag_context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Build prompt for MCQ feedback generation

    Args:
        question_text: The question being answered
        options: Available options (dict of option_key -> option_text)
        student_answer: Student's selected option
        correct_answer: Correct option key
        is_correct: Whether the answer is correct
        rubric: Rubric configuration
        rag_context: Retrieved course material context

    Returns:
        Complete prompt string for AI
    """
    # Extract rubric settings
    grading_criteria = rubric.get("grading_criteria", {})
    feedback_style = rubric.get("feedback_style", {})
    custom_instructions = rubric.get("custom_instructions", "")
    mcq_settings = rubric.get("question_type_settings", {}).get("mcq", {})

    tone = feedback_style.get("tone", "encouraging")
    detail_level = feedback_style.get("detail_level", "detailed")
    include_examples = feedback_style.get("include_examples", True)

    # Build prompt sections
    prompt_parts = []

    # 1. Base instruction
    prompt_parts.append(f"Analyze this multiple choice question answer and provide {tone} educational feedback.")
    prompt_parts.append(f"Detail level: {detail_level}.")
    prompt_parts.append("")

    # 2. Question context
    prompt_parts.append("Question: " + question_text)
    prompt_parts.append("")
    prompt_parts.append("Options:")
    for key, value in options.items():
        prompt_parts.append(f"{key}. {value}")
    prompt_parts.append("")
    prompt_parts.append(f"Student Selected: {student_answer} - {options.get(student_answer, 'N/A')}")
    prompt_parts.append("")
    prompt_parts.append(f"[INTERNAL - For AI only] Correct Answer: {correct_answer}. The student's answer is {'CORRECT' if is_correct else 'INCORRECT'}.")
    prompt_parts.append("")
    prompt_parts.append("⚠️ IMPORTANT: NEVER reveal the correct answer directly in your feedback. Instead, provide:")
    prompt_parts.append("- Comprehensive hints that guide the student toward understanding")
    prompt_parts.append("- Conceptual explanations of the topic")
    prompt_parts.append("- Reasoning about why their choice may or may not be optimal")
    prompt_parts.append("- Guidance to help them discover the answer through learning")
    prompt_parts.append("")

    # 3. RAG context if available
    if rag_context and rag_context.get("has_context"):
        prompt_parts.append(rag_context["formatted_context"])
        prompt_parts.append("")

    # 4. Grading criteria
    if grading_criteria:
        prompt_parts.append("Evaluate the response based on these criteria:")
        for criterion_name, criterion in grading_criteria.items():
            weight = criterion.get("weight", 0)
            description = criterion.get("description", "")
            prompt_parts.append(f"- {criterion_name.title()} ({weight}%): {description}")
        prompt_parts.append("")

    # 5. MCQ-specific guidance
    explain_correct = mcq_settings.get("explain_correct", True)
    explain_incorrect = mcq_settings.get("explain_incorrect", True)
    show_all_options = mcq_settings.get("show_all_options_analysis", False)

    if show_all_options:
        prompt_parts.append("Provide conceptual analysis to help the student understand the topic better, WITHOUT stating which option is correct.")
    elif is_correct and explain_correct:
        prompt_parts.append("Explain why the selected answer demonstrates good understanding and reinforce the key concepts.")
    elif not is_correct and explain_incorrect:
        prompt_parts.append("Help the student understand what they might have misunderstood. Provide hints and conceptual guidance WITHOUT revealing the correct answer.")

    prompt_parts.append("")

    # 6. Output format
    rag_settings = rubric.get("rag_settings", {})
    include_doc_locations = rag_settings.get("include_document_locations", True)

    prompt_parts.append("Please provide feedback in this exact JSON format:")
    prompt_parts.append("{")
    prompt_parts.append(f'  "is_correct": {str(is_correct).lower()},')
    prompt_parts.append(f'  "correctness_score": {100 if is_correct else "score_0_to_100"},')
    prompt_parts.append('  "explanation": "Clear explanation of why the answer is correct/incorrect",')
    if rag_context and rag_context.get("has_context") and include_doc_locations:
        prompt_parts.append('  "improvement_hint": "Specific guidance with EXACT document reference (e.g., \'Review Lab 6, Page 3 on Earth\'s Processor\' or \'See Slide 5 in Lecture 2\')",')
    else:
        prompt_parts.append('  "improvement_hint": "Specific guidance for understanding the concept better",')
    prompt_parts.append('  "concept_explanation": "Brief explanation of the key concept being tested",')
    prompt_parts.append('  "confidence_level": "high/medium/low based on clarity of the question and answer"')
    prompt_parts.append("}")
    prompt_parts.append("")

    # 7. Base tone guidance (can be overridden by custom instructions)
    tone_guidance = {
        "encouraging": "Keep explanations supportive and motivating. Focus on learning and growth.",
        "neutral": "Keep explanations objective and factual. Focus on accuracy and understanding.",
        "strict": "Keep explanations precise and rigorous. Maintain high standards for correctness."
    }
    prompt_parts.append(tone_guidance.get(tone, tone_guidance["encouraging"]))

    if include_examples:
        prompt_parts.append("Include specific examples when helpful.")

    prompt_parts.append("")

    # 8. CUSTOM TEACHER INSTRUCTIONS (HIGHEST PRIORITY - OVERRIDES ALL OTHER TONE/STYLE SETTINGS)
    if custom_instructions:
        prompt_parts.append("=" * 80)
        prompt_parts.append("⚠️ CRITICAL: TEACHER'S CUSTOM INSTRUCTIONS - FOLLOW THESE EXACTLY")
        prompt_parts.append("=" * 80)
        prompt_parts.append(custom_instructions)
        prompt_parts.append("")

        # Detect harsh/strict language and reinforce it
        instruction_lower = custom_instructions.lower()
        harsh_keywords = ["harsh", "scold", "strict", "tough", "rigorous", "demanding", "critical"]
        if any(keyword in instruction_lower for keyword in harsh_keywords):
            prompt_parts.append("⚠️ IMPORTANT: The teacher explicitly wants a strict/harsh approach.")
            prompt_parts.append("- DO NOT soften your language or be overly encouraging")
            prompt_parts.append("- Point out mistakes directly and clearly")
            prompt_parts.append("- Express disappointment or concern when appropriate")
            prompt_parts.append("- Be demanding and set high expectations")
            prompt_parts.append("- The goal is to push the student to do better through tough feedback")

        prompt_parts.append("")
        prompt_parts.append("REMINDER: Teacher's instructions above take ABSOLUTE PRIORITY over any previous tone settings.")
        prompt_parts.append("=" * 80)

    return "\n".join(prompt_parts)


def build_text_feedback_prompt(
    question_text: str,
    question_type: str,
    student_answer: str,
    reference_answer: str,
    rubric: Dict[str, Any],
    rag_context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Build prompt for text-based (short/essay) feedback generation

    Args:
        question_text: The question being answered
        question_type: Type of question ('short' or 'essay')
        student_answer: Student's text response
        reference_answer: Reference/expected answer
        rubric: Rubric configuration
        rag_context: Retrieved course material context

    Returns:
        Complete prompt string for AI
    """
    # Extract rubric settings
    grading_criteria = rubric.get("grading_criteria", {})
    feedback_style = rubric.get("feedback_style", {})
    custom_instructions = rubric.get("custom_instructions", "")
    type_settings = rubric.get("question_type_settings", {}).get(
        "short_answer" if question_type == "short" else "essay",
        {}
    )

    tone = feedback_style.get("tone", "encouraging")
    detail_level = feedback_style.get("detail_level", "detailed")
    include_examples = feedback_style.get("include_examples", True)

    # Build prompt sections
    prompt_parts = []

    # 1. Base instruction
    question_type_label = "short answer" if question_type == "short" else "essay"
    prompt_parts.append(f"Analyze this {question_type_label} response and provide {tone}, {detail_level} educational feedback.")
    prompt_parts.append("")

    # 2. Question context
    prompt_parts.append("Question: " + question_text)
    prompt_parts.append("")
    prompt_parts.append("Student Answer: " + student_answer)
    prompt_parts.append("")
    prompt_parts.append(f"[INTERNAL - For AI only] Reference Answer: {reference_answer}")
    prompt_parts.append("")
    prompt_parts.append("⚠️ IMPORTANT: NEVER reveal the reference answer or give away the solution directly. Instead, provide:")
    prompt_parts.append("- Comprehensive hints and guiding questions")
    prompt_parts.append("- Conceptual explanations of relevant topics")
    prompt_parts.append("- Specific guidance on what aspects to explore or reconsider")
    prompt_parts.append("- Encouragement to think critically about the subject matter")
    prompt_parts.append("")

    # 3. RAG context if available
    if rag_context and rag_context.get("has_context"):
        prompt_parts.append(rag_context["formatted_context"])
        prompt_parts.append("")

    # 4. Grading criteria
    if grading_criteria:
        prompt_parts.append("Evaluate the response based on these criteria:")
        for criterion_name, criterion in grading_criteria.items():
            weight = criterion.get("weight", 0)
            description = criterion.get("description", "")
            prompt_parts.append(f"- {criterion_name.title()} ({weight}%): {description}")
        prompt_parts.append("")

    # 5. Question-type specific requirements
    min_length = type_settings.get("minimum_length", 0)
    check_grammar = type_settings.get("check_grammar", False)
    require_structure = type_settings.get("require_structure", False)
    check_citations = type_settings.get("check_citations", False)
    min_paragraphs = type_settings.get("minimum_paragraphs", 0)

    specific_requirements = []
    if min_length > 0:
        specific_requirements.append(f"Minimum length: {min_length} characters")
    if check_grammar:
        specific_requirements.append("Check for grammar and language quality")
    if require_structure:
        specific_requirements.append("Evaluate response structure and organization")
    if check_citations:
        specific_requirements.append("Check for proper citations and evidence")
    if min_paragraphs > 0:
        specific_requirements.append(f"Expected minimum: {min_paragraphs} paragraphs")

    if specific_requirements:
        prompt_parts.append("Specific Requirements:")
        for req in specific_requirements:
            prompt_parts.append(f"- {req}")
        prompt_parts.append("")

    # 7. Output format
    rag_settings = rubric.get("rag_settings", {})
    include_doc_locations = rag_settings.get("include_document_locations", True)

    prompt_parts.append("Please provide detailed feedback in this exact JSON format:")
    prompt_parts.append("{")
    prompt_parts.append('  "is_correct": "true/false (true if substantially correct)",')
    prompt_parts.append('  "correctness_score": "score_from_0_to_100",')
    prompt_parts.append('  "explanation": "Detailed analysis of the student\'s response",')
    prompt_parts.append('  "strengths": ["What the student got right - array of strings"],')
    prompt_parts.append('  "weaknesses": ["Areas for improvement - array of strings"],')
    if rag_context and rag_context.get("has_context") and include_doc_locations:
        prompt_parts.append('  "improvement_hint": "Specific guidance with EXACT document references where to study (e.g., \'To understand this better, carefully review Lab 6, Page 3, the section on Earth\'s Processor\' or \'Study Slide 12-15 in Lecture 3 on Memory Management\')",')
    else:
        prompt_parts.append('  "improvement_hint": "Specific guidance for better understanding",')
    prompt_parts.append('  "concept_explanation": "Brief explanation of key concepts",')
    prompt_parts.append('  "missing_concepts": ["Important concepts not addressed - array of strings"],')
    prompt_parts.append('  "confidence_level": "high/medium/low based on answer quality"')
    prompt_parts.append("}")
    prompt_parts.append("")

    # 8. Base tone guidance (can be overridden by custom instructions)
    tone_guidance = {
        "encouraging": "Be constructive and supportive. Highlight both strengths and areas for growth. Focus on helping the student improve.",
        "neutral": "Be objective and analytical. Provide balanced feedback focusing on accuracy and understanding.",
        "strict": "Maintain high standards. Be specific about what's missing or incorrect. Reference exact requirements."
    }
    prompt_parts.append(tone_guidance.get(tone, tone_guidance["encouraging"]))

    if include_examples:
        prompt_parts.append("Provide specific examples to illustrate your points.")

    prompt_parts.append("")

    # 9. CUSTOM TEACHER INSTRUCTIONS (HIGHEST PRIORITY - OVERRIDES ALL OTHER TONE/STYLE SETTINGS)
    if custom_instructions:
        prompt_parts.append("=" * 80)
        prompt_parts.append("⚠️ CRITICAL: TEACHER'S CUSTOM INSTRUCTIONS - FOLLOW THESE EXACTLY")
        prompt_parts.append("=" * 80)
        prompt_parts.append(custom_instructions)
        prompt_parts.append("")

        # Detect harsh/strict language and reinforce it
        instruction_lower = custom_instructions.lower()
        harsh_keywords = ["harsh", "scold", "strict", "tough", "rigorous", "demanding", "critical"]
        if any(keyword in instruction_lower for keyword in harsh_keywords):
            prompt_parts.append("⚠️ IMPORTANT: The teacher explicitly wants a strict/harsh approach.")
            prompt_parts.append("- DO NOT soften your language or be overly encouraging")
            prompt_parts.append("- Point out mistakes directly and clearly")
            prompt_parts.append("- Express disappointment or concern when appropriate")
            prompt_parts.append("- Be demanding and set high expectations")
            prompt_parts.append("- The goal is to push the student to do better through tough feedback")

        prompt_parts.append("")
        prompt_parts.append("REMINDER: Teacher's instructions above take ABSOLUTE PRIORITY over any previous tone settings.")
        prompt_parts.append("=" * 80)

    return "\n".join(prompt_parts)


def format_grading_criteria(criteria: Dict[str, Any]) -> str:
    """
    Format grading criteria for display in prompts

    Args:
        criteria: Grading criteria dict

    Returns:
        Formatted string
    """
    if not criteria:
        return ""

    lines = ["Grading Criteria:"]
    for name, details in criteria.items():
        weight = details.get("weight", 0)
        description = details.get("description", "")
        lines.append(f"- {name.title()} ({weight}%): {description}")

    return "\n".join(lines)


def get_tone_instructions(tone: str) -> str:
    """
    Get specific instructions for different feedback tones

    Args:
        tone: Feedback tone ('encouraging', 'neutral', 'strict')

    Returns:
        Tone-specific instructions
    """
    tone_map = {
        "encouraging": "Use positive, supportive language. Celebrate strengths and frame weaknesses as opportunities for growth.",
        "neutral": "Use objective, balanced language. Focus on factual assessment without emotional language.",
        "strict": "Use precise, rigorous language. Maintain high standards and be specific about shortcomings."
    }

    return tone_map.get(tone, tone_map["encouraging"])


def should_include_context(rubric: Dict[str, Any], question_type: str) -> bool:
    """
    Determine if RAG context should be included based on rubric settings

    Args:
        rubric: Rubric configuration
        question_type: Type of question

    Returns:
        True if RAG should be used
    """
    rag_settings = rubric.get("rag_settings", {})

    if not rag_settings.get("enabled", True):
        return False

    # RAG should be enabled for ALL question types when course materials are available
    # For MCQ: Feedback will reference specific document sections (e.g., "Review Lab 6, page 3")
    # Note: 'show_all_options_analysis' controls feedback STYLE, not whether to use RAG
    if question_type == "mcq":
        # Always enable RAG for MCQ to provide document-referenced feedback
        # This ensures students get feedback citing uploaded course materials
        return True

    # Always use RAG for short answer and essay questions
    return True
