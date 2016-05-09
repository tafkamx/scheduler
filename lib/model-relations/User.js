'use strict';

M.User.relations = {
  info: {
    type: 'HasOne',
    relatedModel: M.UserInfo,
    ownerCol: 'id',
    relatedCol: 'user_id'
  }
};
