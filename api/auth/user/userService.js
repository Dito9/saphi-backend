const _ = require('lodash');
const moment = require('moment-timezone');

const { User } = require('./userModel');
const { setResponse } = require('../../utils');

const listUser = async reqQuery => {
  const users = await User.find();
  return setResponse(200, 'Users found.', users);
};

const readUser = async reqParams => {
  const user = await User.findById(reqParams.id);
  if (!user) return setResponse(404, 'User not found.');

  return setResponse(200, 'User found.', user);
};

const readUserByFieldIds = async reqBody => {
  const user = await User.findByIds(reqBody);
  if (!user) return setResponse(404, 'User not found.');

  return setResponse(200, 'User found.', user);
};

const createUser = async reqBody => {
  let user = await User.findByIds(reqBody);
  if (user) return setResponse(400, 'User already exists.');

  user = new User(reqBody);
  await user.save();

  user = await User.findById(user.id, { password: 0 });

  return setResponse(201, 'User created.', user);
};

const onboarding = async (reqBody, reqUser) => {
  await User.findByIdAndUpdate(reqUser.id, reqBody);
};

const getUserByPhoneOrEmail = async phoneOrEmail => {
  const emailRegex = /^.{2,}@.{2,}\..{2,}$/g;
  const phoneRegex = /^\+?[0-9]{9,}$/g;

  let user = null;

  let email = phoneOrEmail.match(emailRegex);
  if (email) {
    [email] = email;
    user = await User.findOne({ email });
  } else email = '';

  let phone = phoneOrEmail.match(phoneRegex);
  if (phone) {
    // ? Check phonePrefix also ?
    phone = phone[0].substr(phone.length - 9, 9);
    user = await User.findOne({ phoneNumber: phone });
  } else phone = '';

  if (!user) return setResponse(404, 'User not found.', {});
  return setResponse(200, 'User found.', { user, email, phone });
};

const forgotPassword = async reqBody => {
  const response = await getUserByPhoneOrEmail(reqBody.phoneOrEmail);

  if (response.status !== 200) return response;

  const code = '1234';
  const expires = moment
    .tz('America/Lima')
    .add(1, 'hours')
    .format();
  await User.findByIdAndUpdate(response.data.user.id, {
    actionCode: { code, expires },
  });

  // TODO: Send code phone or email
  return setResponse(200, 'Code Sended.', {});
};

const checkCode = async reqBody => {
  const response = await getUserByPhoneOrEmail(reqBody.phoneOrEmail);
  if (response.status !== 200) return response;

  if (!response.data.user.actionCode)
    return setResponse(400, 'No code for user.', {});

  if (!response.data.user.actionCode.expires > moment.tz('America/Lima'))
    return setResponse(400, 'Expired code.', {});

  if (response.data.user.actionCode.code !== reqBody.code)
    return setResponse(400, 'Incorrect code.', {});

  return setResponse(200, 'Correct code.', {});
};

const resetPassword = async reqBody => {
  const response = await checkCode(reqBody);
  if (response.status !== 200) return response;

  await User.findOneAndUpdate(
    { 'actionCode.code': reqBody.code },
    { password: reqBody.newPassword },
  );
  return setResponse(200, 'Password updated.', {});
};

module.exports = {
  listUser,
  readUser,
  readUserByFieldIds,
  createUser,
  onboarding,
  forgotPassword,
  checkCode,
  resetPassword,
};
