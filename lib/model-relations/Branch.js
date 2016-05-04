'use strict';

Branch.relations = {
  settings : {
    type : 'HasOne',
    relatedModel: BranchSettings,
    ownerCol: 'id',
    relatedCol: 'branch_id'
  }
}
