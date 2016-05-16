'use strict';

M.Branch.relations = {
  settings : {
    type : 'HasOne',
    relatedModel: M.BranchSettings,
    ownerCol: 'id',
    relatedCol: 'branch_id'
  }
}
