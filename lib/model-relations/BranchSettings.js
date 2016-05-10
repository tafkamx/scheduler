'use strict';

BranchSettings.relations = {
  branch : {
    type : 'HasOne',
    relatedModel: Branch,
    ownerCol: 'branch_id',
    relatedCol: 'id'
  }
}
