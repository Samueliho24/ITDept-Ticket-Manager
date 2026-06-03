import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from BackEnd.app.models.users import Users
from BackEnd.app.core.security import hash_password


def default_admin(db: Session) -> None:
    admin = db.query(Users).filter(Users.role == "admin").first()
    if not admin:
        user = Users(
            id=str(uuid.uuid4()),
            name="Admin",
            lastname="Sistema",
            username="admin",
            password=hash_password("admin"),
            role="admin",
            active=True,
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
    else:
        print("Usuario por defecto ya existe")
