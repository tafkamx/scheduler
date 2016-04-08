'use strict';

InstallationManager.ResetPasswordToken.relations = {
  user: {
    type: 'HasOne',
    relatedModel: InstallationManager.User,
    ownerCol: 'user_id',
    relatedCol: 'id'
  }
};
