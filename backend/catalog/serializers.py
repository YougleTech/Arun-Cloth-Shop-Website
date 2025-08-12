# catalog/serializers.py
from rest_framework import serializers
from .models import HeroSlide

class HeroSlideSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = [
            "id", "title", "subtitle", "button_text", "button_link",
            "image", "sort_order"
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class AdminHeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = [
            "id", "title", "subtitle", "button_text", "button_link",
            "image", "is_active", "sort_order", "created_at"
        ]
        read_only_fields = ["id", "created_at"]
