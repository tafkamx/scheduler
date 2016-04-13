'use strict';

InstallationManager.User.relations = {
  info: {
    type: 'HasOne',
    relatedModel: InstallationManager.UserInfo,
    ownerCol: 'id',
    relatedCol: 'user_id'
  }
};
