-- Find questions missing correct answers
SELECT 
    id,
    question,
    type,
    module_id,
    correct_option_id,
    correct_answer,
    options
FROM questions
WHERE module_id = '526dc029-bca2-4375-a13b-1fb5e132f55c'
  AND (correct_option_id IS NULL OR correct_option_id = '')
  AND (correct_answer IS NULL OR correct_answer = '');
