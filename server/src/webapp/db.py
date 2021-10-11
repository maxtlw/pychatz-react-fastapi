from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()


# TODO: Make it safe!
class Repository:
    engine = None
    SessionLocal = None


class DataAccessLayer(Repository):
    def __init__(self, conn_string: str, echo: bool = False):
        self.conn_string = conn_string
        self.echo = echo

    def connect(self):
        self.engine = create_engine(self.conn_string,
                                    echo=self.echo,
                                    future=True,
                                    connect_args={"check_same_thread": False}
                                    )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine,
                                         autocommit=False,
                                         autoflush=False)

    def generate_session(self):
        db = self.SessionLocal()    # type: ignore
        try:
            yield db
        finally:
            db.close()
