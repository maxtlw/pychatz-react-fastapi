import pytest
from fastapi.testclient import TestClient

from webapp import app, dal
from webapp.models import User
from webapp.services import user_exists


@pytest.fixture
def webapp_test_client(test_dal) -> TestClient:
    app.dependency_overrides[dal.generate_session] = test_dal.generate_session
    client = TestClient(app)
    return client


# signup ---------------------------------------------------
def test_signin_working(webapp_test_client, test_session):
    response = webapp_test_client.post('/signin',
                                       json={'username': 'fancysquirrel', 'plain_password': 'fancysquirrel_pwd'}
                                       )
    assert response.status_code == 200
    user_exists(test_session, 'fancysquirrel')

    response = webapp_test_client.post('/signin',
                                       json={'username': 'fancymonkey', 'plain_password': 'fancymonkey_pwd'}
                                       )
    assert response.status_code == 200
    user_exists(test_session, 'fancymonkey')


def test_insert_repeated_user(webapp_test_client, test_session):
    response = webapp_test_client.post('/signin',
                                       json={'username': 'fancysquirrel1', 'plain_password': 'fancysquirrel_pwd'}
                                       )
    assert response.status_code == 200
    test_session.query(User).filter(User.username == 'fancysquirrel1').one()

    response = webapp_test_client.post('/signin',
                                       json={'username': 'fancysquirrel1', 'plain_password': 'fancysquirrel_pwd'}
                                       )
    assert response.status_code == 403
    test_session.query(User).filter(User.username == 'fancysquirrel1').one()
# ---------------------------------------------------------


# login_for_access_token ----------------------------------
def test_login_for_tokens_nonexistent_user(webapp_test_client):     # Expected 404 NOT FOUND
    response = webapp_test_client.post('/token',
                                       data={'username': 'nonexistent_squirrel', 'password': 'nonexistent_password'}
                                       )
    assert response.status_code == 404


def test_login_for_tokens_wrong_password(webapp_test_client):       # Expected 403 FORBIDDEN
    user_data = {'username': 'jas', 'plain_password': 'jas_pwd'}
    _ = webapp_test_client.post('/signin',
                                json=user_data
                                )
    response = webapp_test_client.post('/token',
                                       data={'username': user_data['username'], 'password': 'awrongpassword'}
                                       )
    assert response.status_code == 403


def test_login_for_tokens_working(webapp_test_client):
    user_data_signin = {'username': 'fancysquirrel3', 'plain_password': 'fancysquirrel_pwd'}
    user_data = {'username': 'fancysquirrel3', 'password': 'fancysquirrel_pwd'}
    _ = webapp_test_client.post('/signin',
                                json=user_data_signin
                                )
    response = webapp_test_client.post('/token',
                                       data=user_data
                                       )
    assert response.status_code == 200
    json_response = response.json()
    assert "access_token" in json_response
    assert "token_type" in json_response
    assert json_response['token_type'] == 'bearer'

    access_token = json_response['access_token']
    headers = {'Authorization': 'Bearer ' + access_token}
    response = webapp_test_client.get('/user',
                                      headers=headers
                                      )
    assert response.status_code == 200
    json_response = response.json()
    assert "current_user" in json_response
    assert json_response["current_user"] == user_data["username"]


def test_login_for_tokens_wrong_token(webapp_test_client):      # Expected 401 UNAUTHORIZED
    fake_access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" \
                        ".eyJzdWIiOiJiYWRndXkiLCJleHAiOjE2MzIzMDQxMjJ9" \
                        ".-OxWniZFl5vuDkg_vVz5HBtXoFtO49lekobSUJplSXM"
    headers = {'Authorization': 'Bearer ' + fake_access_token}
    response = webapp_test_client.get('/user',
                                      headers=headers
                                      )
    assert response.status_code == 401
# ---------------------------------------------------------


# def test_socket_change_private_peer(webapp_test_client):
#     # Signup
#     _ = webapp_test_client.post('/signin',
#                                 json={'username': 'squirrel', 'plain_password': 'squirrel_pwd'}
#                                 )
#     _ = webapp_test_client.post('/signin',
#                                 json={'username': 'monkey', 'plain_password': 'monkey_pwd'}
#                                 )
#     # Login
#     response = webapp_test_client.post('/token',
#                                        data={'username': 'squirrel', 'password': 'squirrel_pwd'}
#                                        )
#     response_json = response.json()
#     token = response_json['access_token']
#
#     with webapp_test_client.websocket_connect(f"/ws/{token}") as websocket:
#         cpr = ChangePeerRequest(new_peer='monkey')
#         _ = webapp_test_client.post('/signin',
#                                     json={'username': 'aaa', 'plain_password': 'monkey_pwd'}
#                                     )
#         websocket.send_json(cpr.dict())
#         data = websocket.receive_json()
#         assert data.keys() == {'type', 'id', 'receiver', 'timestamp'}
#         assert data['type'] == "ACK"
