from rest_framework import serializers
from .models import Attempt, AttemptAnswer
from apps.quizzes.serializers import QuizSerializer

class AttemptAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttemptAnswer
        fields = ('id', 'question', 'selected_choice')

class AttemptSerializer(serializers.ModelSerializer):
    answers = AttemptAnswerSerializer(many=True, read_only=True)
    quiz_title = serializers.ReadOnlyField(source='quiz.title')

    class Meta:
        model = Attempt
        fields = ('id', 'user', 'quiz', 'quiz_title', 'start_time', 'end_time', 'score', 'status', 'answers')
        read_only_fields = ('user', 'start_time', 'end_time', 'score', 'status')
