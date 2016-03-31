'use strict';

UserInfo.relations = {
  user: {
    type: 'HasOne',
    relatedModel: User,
    ownerCol: 'user_id',
    relatedCol: 'id'
  }
};

