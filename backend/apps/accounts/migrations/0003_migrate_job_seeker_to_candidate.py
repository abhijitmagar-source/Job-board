from django.db import migrations


def migrate_roles(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(role="job_seeker").update(role="candidate")


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_alter_user_role_candidateprofile_recruiterprofile_and_more"),
    ]

    operations = [
        migrations.RunPython(migrate_roles, migrations.RunPython.noop),
    ]
