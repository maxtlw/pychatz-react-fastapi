from dataclasses import dataclass

""" Configuration values """


@dataclass(frozen=True)
class DBConfig:
    max_username_length: int = 16


DB_CONFIG = DBConfig()
