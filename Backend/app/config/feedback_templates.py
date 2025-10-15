"""
Default feedback rubric templates for different course types
Teachers can choose a template or customize their own
"""

RUBRIC_TEMPLATES = {
    "default": {
        "name": "General Purpose",
        "description": "Balanced rubric suitable for most courses",
        "config": {
            "enabled": True,
            "grading_criteria": {
                "accuracy": {"weight": 40, "description": "Correctness of the answer"},
                "completeness": {"weight": 30, "description": "Covers all required points"},
                "clarity": {"weight": 20, "description": "Clear and well-structured explanation"},
                "depth": {"weight": 10, "description": "Level of detail and insight"}
            },
            "feedback_style": {
                "tone": "encouraging",
                "detail_level": "detailed",
                "include_examples": True,
                "reference_course_material": True
            },
            "rag_settings": {
                "enabled": True,
                "max_context_chunks": 3,
                "similarity_threshold": 0.7,
                "include_source_references": True
            },
            "custom_instructions": "",
            "question_type_settings": {
                "mcq": {
                    "explain_correct": True,
                    "explain_incorrect": True,
                    "show_all_options_analysis": False
                },
                "short_answer": {
                    "minimum_length": 50,
                    "check_grammar": False
                },
                "essay": {
                    "require_structure": True,
                    "check_citations": False,
                    "minimum_paragraphs": 2
                }
            }
        }
    },

    "stem_course": {
        "name": "STEM / Science",
        "description": "Focus on accuracy, methodology, and problem-solving",
        "config": {
            "enabled": True,
            "grading_criteria": {
                "accuracy": {"weight": 50, "description": "Correct answer and methodology"},
                "methodology": {"weight": 25, "description": "Proper problem-solving approach"},
                "explanation": {"weight": 15, "description": "Clear reasoning and steps"},
                "units_notation": {"weight": 10, "description": "Correct units and notation"}
            },
            "feedback_style": {
                "tone": "neutral",
                "detail_level": "detailed",
                "include_examples": True,
                "reference_course_material": True
            },
            "rag_settings": {
                "enabled": True,
                "max_context_chunks": 3,
                "similarity_threshold": 0.75,
                "include_source_references": True
            },
            "custom_instructions": "Focus on mathematical accuracy and proper methodology. Reference formulas and principles from course materials.",
            "question_type_settings": {
                "mcq": {
                    "explain_correct": True,
                    "explain_incorrect": True,
                    "show_all_options_analysis": True
                },
                "short_answer": {
                    "minimum_length": 30,
                    "check_grammar": False
                },
                "essay": {
                    "require_structure": True,
                    "check_citations": True,
                    "minimum_paragraphs": 2
                }
            }
        }
    },

    "humanities": {
        "name": "Humanities / Liberal Arts",
        "description": "Emphasize critical thinking, argumentation, and expression",
        "config": {
            "enabled": True,
            "grading_criteria": {
                "argumentation": {"weight": 35, "description": "Strength of argument and reasoning"},
                "evidence": {"weight": 25, "description": "Use of supporting evidence"},
                "clarity": {"weight": 25, "description": "Clear and articulate expression"},
                "originality": {"weight": 15, "description": "Original thought and insight"}
            },
            "feedback_style": {
                "tone": "encouraging",
                "detail_level": "detailed",
                "include_examples": True,
                "reference_course_material": True
            },
            "rag_settings": {
                "enabled": True,
                "max_context_chunks": 5,
                "similarity_threshold": 0.65,
                "include_source_references": True
            },
            "custom_instructions": "Encourage critical thinking and original analysis. Emphasize the importance of supporting arguments with evidence.",
            "question_type_settings": {
                "mcq": {
                    "explain_correct": True,
                    "explain_incorrect": True,
                    "show_all_options_analysis": False
                },
                "short_answer": {
                    "minimum_length": 100,
                    "check_grammar": True
                },
                "essay": {
                    "require_structure": True,
                    "check_citations": True,
                    "minimum_paragraphs": 3
                }
            }
        }
    },

    "language_learning": {
        "name": "Language Learning",
        "description": "Focus on grammar, vocabulary, and communication",
        "config": {
            "enabled": True,
            "grading_criteria": {
                "grammar": {"weight": 35, "description": "Grammatical accuracy"},
                "vocabulary": {"weight": 25, "description": "Appropriate word choice"},
                "fluency": {"weight": 25, "description": "Natural expression and flow"},
                "comprehension": {"weight": 15, "description": "Understanding of context"}
            },
            "feedback_style": {
                "tone": "encouraging",
                "detail_level": "detailed",
                "include_examples": True,
                "reference_course_material": False
            },
            "rag_settings": {
                "enabled": False,
                "max_context_chunks": 2,
                "similarity_threshold": 0.7,
                "include_source_references": False
            },
            "custom_instructions": "Provide constructive feedback on language use. Highlight both errors and successes. Suggest alternative phrasings when appropriate.",
            "question_type_settings": {
                "mcq": {
                    "explain_correct": True,
                    "explain_incorrect": True,
                    "show_all_options_analysis": False
                },
                "short_answer": {
                    "minimum_length": 20,
                    "check_grammar": True
                },
                "essay": {
                    "require_structure": True,
                    "check_citations": False,
                    "minimum_paragraphs": 2
                }
            }
        }
    },

    "professional_skills": {
        "name": "Professional / Business Skills",
        "description": "Practical application and real-world scenarios",
        "config": {
            "enabled": True,
            "grading_criteria": {
                "practical_application": {"weight": 40, "description": "Real-world applicability"},
                "understanding": {"weight": 30, "description": "Conceptual understanding"},
                "professionalism": {"weight": 20, "description": "Professional communication"},
                "completeness": {"weight": 10, "description": "Thorough response"}
            },
            "feedback_style": {
                "tone": "neutral",
                "detail_level": "moderate",
                "include_examples": True,
                "reference_course_material": True
            },
            "rag_settings": {
                "enabled": True,
                "max_context_chunks": 3,
                "similarity_threshold": 0.7,
                "include_source_references": True
            },
            "custom_instructions": "Focus on practical application and professional scenarios. Relate concepts to real-world business contexts.",
            "question_type_settings": {
                "mcq": {
                    "explain_correct": True,
                    "explain_incorrect": True,
                    "show_all_options_analysis": False
                },
                "short_answer": {
                    "minimum_length": 50,
                    "check_grammar": True
                },
                "essay": {
                    "require_structure": True,
                    "check_citations": False,
                    "minimum_paragraphs": 2
                }
            }
        }
    },

    "strict_grading": {
        "name": "Strict / Exam Preparation",
        "description": "High standards with detailed feedback",
        "config": {
            "enabled": True,
            "grading_criteria": {
                "accuracy": {"weight": 60, "description": "Absolute correctness"},
                "completeness": {"weight": 25, "description": "All required elements present"},
                "presentation": {"weight": 15, "description": "Professional presentation"}
            },
            "feedback_style": {
                "tone": "strict",
                "detail_level": "detailed",
                "include_examples": True,
                "reference_course_material": True
            },
            "rag_settings": {
                "enabled": True,
                "max_context_chunks": 4,
                "similarity_threshold": 0.8,
                "include_source_references": True
            },
            "custom_instructions": "Maintain high standards. Be specific about what's missing or incorrect. Reference exact course material requirements.",
            "question_type_settings": {
                "mcq": {
                    "explain_correct": True,
                    "explain_incorrect": True,
                    "show_all_options_analysis": True
                },
                "short_answer": {
                    "minimum_length": 50,
                    "check_grammar": True
                },
                "essay": {
                    "require_structure": True,
                    "check_citations": True,
                    "minimum_paragraphs": 3
                }
            }
        }
    }
}


def get_template(template_name: str) -> dict:
    """Get a rubric template by name"""
    return RUBRIC_TEMPLATES.get(template_name, RUBRIC_TEMPLATES["default"])


def list_templates() -> list:
    """List all available templates with metadata"""
    return [
        {
            "key": key,
            "name": template["name"],
            "description": template["description"]
        }
        for key, template in RUBRIC_TEMPLATES.items()
    ]
