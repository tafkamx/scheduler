'use strict';

M.User.relations = {
  account: {
    type: 'HasOne',
    relatedModel: M.Account,
    ownerCol: 'id',
    relatedCol: 'user_id',
  },
};
