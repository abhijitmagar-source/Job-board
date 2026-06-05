from rest_framework.routers import DefaultRouter

from apps.jobs.views import JobViewSet, SavedJobViewSet

router = DefaultRouter()
router.register("jobs", JobViewSet, basename="job")
router.register("saved-jobs", SavedJobViewSet, basename="saved-job")

urlpatterns = router.urls
