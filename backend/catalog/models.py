# app: catalog (or core/marketing — wherever your API lives)
# catalog/models.py
from django.db import models
import uuid

def hero_slide_upload_path(instance, filename):
    return f"hero_slides/{instance.id}/{filename}"

class HeroSlide(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150, blank=True)
    subtitle = models.CharField(max_length=250, blank=True)
    button_text = models.CharField(max_length=50, blank=True)
    button_link = models.URLField(blank=True)
    image = models.ImageField(upload_to=hero_slide_upload_path)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.title or f"Slide {self.pk}"
