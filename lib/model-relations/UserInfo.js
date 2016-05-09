'use strict';

M.UserInfo.relations = {
  user: {
    type: 'HasOne',
    relatedModel: M.User,
    ownerCol: 'user_id',
    relatedCol: 'id'
  }
};

