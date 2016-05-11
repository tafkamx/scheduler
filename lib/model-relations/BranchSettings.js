'use strict';

M.BranchSettings.relations = {
  branch : {
    type : 'HasOne',
    relatedModel: M.Branch,
    ownerCol: 'branch_id',
    relatedCol: 'id'
  }
}
