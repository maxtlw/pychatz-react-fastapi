import pytest

from webapp.db import DataAccessLayer


@pytest.fixture
def test_dal():
    dal = DataAccessLayer('sqlite:///:memory:', echo=True)
    dal.connect()
    return dal


@pytest.fixture
def test_session(test_dal):
    for session in test_dal.generate_session():
        yield session
