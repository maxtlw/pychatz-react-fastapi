import pytest

from webapp.schemas import UserCreate
from webapp.services import (
    insert_new_user,
    query_users,
    mark_message_as_deleted,
    user_exists,
    insert_new_message,
    UserAlreadyExists,
    authenticate_user,
    WrongPassword,
    UserDoesNotExist
)


# insert_new_user ----------------------------------
def test_insert_legit_username(test_session):
    assert insert_new_user(test_session, UserCreate(username='squirrel', plain_password='squirrel_pwd'))
    user_exists(test_session, 'squirrel')


def test_insert_abnormally_long_username(test_session):
    with pytest.raises(ValueError):
        insert_new_user(test_session, UserCreate(
                        username=str(['A']*10000),
                        plain_password='squirrel_pwd')
                        )


def test_insert_duplicated_user(test_session):
    insert_new_user(test_session, UserCreate(
                    username='squirrel',
                    plain_password='squirrel_pwd')
                    )

    with pytest.raises(UserAlreadyExists):
        insert_new_user(test_session, UserCreate(
                        username='squirrel',
                        plain_password='squirrel_pwd')
                        )
# --------------------------------------------------


# authenticate_user --------------------------------
def test_authenticate_user(test_session):
    insert_new_user(test_session, UserCreate(
                    username='squirrel',
                    plain_password='squirrel_pwd')
                    )

    # Correct password: this should work
    authenticate_user(test_session, 'squirrel', 'squirrel_pwd')

    # Not existing user
    with pytest.raises(UserDoesNotExist):
        authenticate_user(test_session, 'not_the_squirrel', 'some_pwd')

    # Wrong password
    with pytest.raises(WrongPassword):
        authenticate_user(test_session, 'squirrel', 'not_the_squirrel_pwd')
# --------------------------------------------------


# query_users --------------------------------------
def test_query_users(test_session):
    insert_new_user(test_session, UserCreate(
        username='squirrel',
        plain_password='squirrel_pwd')
                    )
    insert_new_user(test_session, UserCreate(
        username='monkey',
        plain_password='monkey_pwd')
                    )
    insert_new_user(test_session, UserCreate(
        username='elephant',
        plain_password='elephant_pwd')
                    )
    assert len(query_users(test_session, '', 'justafakeusername')) == 3     # Just for sanity check
    assert len(query_users(test_session, '', 'squirrel')) == 2
    queried_users = query_users(test_session, 'm', 'squirrel')  # expected: monkey
    assert len(queried_users) == 1
    assert queried_users[0].username == 'monkey'
    queried_users = query_users(test_session, 'e', 'squirrel')  # expected: monkey, elephant
    assert 'monkey' in [q.username for q in queried_users]
    assert 'elephant' in [q.username for q in queried_users]
    queried_users = query_users(test_session, 'qui', 'monkey')  # expected: squirrel
    assert len(queried_users) == 1
    assert queried_users[0].username == 'squirrel'
# --------------------------------------------------


# query_messages -----------------------------------
# (test is meaningless now)
# --------------------------------------------------


# user_exists -----------------------------------
# (test is meaningless now)
# --------------------------------------------------


# insert_new_message -------------------------------
# (test is meaningless now: logic is somewhere else)
# --------------------------------------------------


# delete_message -----------------------------------
def test_delete_message(test_session):
    insert_new_user(test_session, UserCreate(
        username='squirrel',
        plain_password='squirrel_pwd')
                    )
    insert_new_user(test_session, UserCreate(
        username='monkey',
        plain_password='monkey_pwd')
                    )
    message = 'message1'
    message_1 = insert_new_message(test_session, message, 'squirrel', 'monkey')
    message = 'message 2'
    message_2 = insert_new_message(test_session, message, 'monkey', 'squirrel')

    # Try to delete a nonexistent message (bad id)
    with pytest.raises(ValueError):
        mark_message_as_deleted(test_session, -1, 'squirrel')
    # Try to delete a message that does not belong to the user
    with pytest.raises(ValueError):
        mark_message_as_deleted(test_session, message_2.id, message_1.sender_username)
    # This should work
    mark_message_as_deleted(test_session, message_1.id, message_1.sender_username)
    mark_message_as_deleted(test_session, message_2.id, message_2.sender_username)
# --------------------------------------------------
