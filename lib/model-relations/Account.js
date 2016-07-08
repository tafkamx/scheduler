'use strict';

M.Account.relations = {
  location: {
    type: 'HasOne',
    relatedModel: M.Location,
    ownerCol: 'location_id',
    relatedCol: 'id',
  },
};
