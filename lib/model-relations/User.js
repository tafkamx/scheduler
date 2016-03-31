'use strict';

User.relations = {
  info: {
    type: 'HasOne',
    relatedModel: UserInfo,
    ownerCol: 'id',
    relatedCol: 'user_id'
  }
};
