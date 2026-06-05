from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.jobs.cache import invalidate_job_list_cache
from apps.jobs.models import Job


@receiver(post_save, sender=Job)
@receiver(post_delete, sender=Job)
def bust_job_list_cache_on_job_change(sender, **kwargs) -> None:
    invalidate_job_list_cache()
