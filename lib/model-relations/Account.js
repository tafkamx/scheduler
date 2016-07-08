'use strict';

M.Account.relations = {
  location: {
    type: 'HasOne',
    relatedModel: M.Location,
    ownerCol: 'location_id',
    relatedCol: 'id',
  },
  branch : {
    type : 'HasOne',
    relatedModel : M.Branch,
    ownerCol : 'branch_id',
    relatedCol : 'id'
  }
};
