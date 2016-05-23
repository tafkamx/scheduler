# Franchisee spec

## Intro

We need Franchisees, which have all the same permissions as
Franchisors but only within their own Branch.  Franchisees are Branch
local.

Franchisors are there to manage the Installation and to see how the
Branches are doing.  Franchisees are paying the Franchisor in order to
have a branch under the Installation's name, which means they should
be able to manage whatever is in their Branch, ATM that means Staff
Members.

## Constraints

- Should fit within the Accounts system.

## Assumptions

- The Accounts system is finished.
- There will only be one Franchisee per branch.
- There will be some way to manipulate the Franchisee of a Branch.

## Functional spec

### Accounts system

Should make use of the Accounts system in order to enable the workflow
of being Franchisee in one Branch and a student in another.

Also the Accounts system naturally ties the person to a specific
branch, which is good for Franchisees cause they're tied to Branches.

### ACL

Should be able to do everything the Franchisor, except he is limited
to his own Branch and cannot do anything outside of his own Branch.

### `default` Branch

This branch by default will have no assigned Franchisee.  Because
there are sure to be Installations with only the Franchisor, and the
Franchisor has access to all the Branches so it's fine.

## Technical spec

### ACL

The ACL tree would be like, "Franchisor inherits Franchisee which
inherits from *".

The above means Franchisee ACL would be inherited from another role
which isn't specified, and it would be able to do everything within
his own Branch.  The Franchisor would then inherit the Franchisee's
ACL and make his permissions global.

### `Account` model

The `M.Account.types` static property needs to be updated to include
the Franchisee stuff:

```
types: {
  ...
  franchisee: 'Franchisee',
  ...
},
```

### `Franchisees` table

This is an Account type table.

Fields:

- `id`
- `account_id`
  - Points to `Accounts.id`
- timestamps

### `Franchisee` model

Should point to the `Franchisees` table.

Validations:

- `account_id`
  - Required
  - `Accounts.id` should exist
