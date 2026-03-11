from django.utils import timezone
from apps.attempts.models import Attempt, AttemptAnswer
from apps.users.models import User

class QuizEvaluationService:
    @staticmethod
    def evaluate_attempt(attempt_id):
        try:
            attempt = Attempt.objects.get(id=attempt_id)
        except Attempt.DoesNotExist:
            return None

        if attempt.status == 'COMPLETED':
            return attempt # already evaluated

        answers = AttemptAnswer.objects.filter(attempt=attempt)
        
        total_score = 0
        for answer in answers:
            if answer.selected_choice.is_correct:
                total_score += answer.question.points

        attempt.score = total_score
        attempt.status = 'COMPLETED'
        attempt.end_time = timezone.now()
        attempt.save()

        # Update user total score
        user = attempt.user
        user.total_score += total_score
        user.save()

        return attempt
