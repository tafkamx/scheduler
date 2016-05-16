# Staff Members spec

## Intro

We need to be able to run CRUD operations of Staff Members.

For the time being this role is not to keep track of any data, it's
just to be able to figure out the user's role and do the appropriate
ACL.

## Constraints

- Only a Franchisor or a Franchisee should be able to run CRUD
  operations on Staff Members.

## Assumptions

- There are Franchisors in the system.
- There are Franchisees in the system.
- The Accounts system is finished.

## Functional spec

### Database

#### `StaffMembers` table

This is an Account type table.

Fields:

- `id`
- `account_id`
- timestamps

#### `StaffMember` model

Should point to `StaffMembers` table.

Validations:

- `account_id`
  - Required

#### `Account` model

Add the `StaffMember` model to the `types` class property of the model.

### ACL

All the actions related to CRUD on Staff Members should follow the
following ACL rules:

- CREATE
  - A Franchisor can create Staff Members.
  - A Franchisee can create Staff Members.
- READ
  - A Franchisor can see Staff Members.
  - A Franchisee can see Staff Members.
  - A Staff Member can see himself.
- UPDATE
  - A Franchisor can update Staff Members.
  - A Franchisee can update Staff Members.
  - A Staff Member can update himself.
- DELETE
  - A Franchisor can delete Staff Members.
  - A Franchisee can delete Staff Members.

### Controller

Defined in `controllers/StaffMembersController.js`.

Should just define the basic CRUD functionality using the standard
REST API (provided by the `RestfulController`).

### Routes

Routes for the controller `StaffMembersController` should be under
`/admin/StaffMembers`.
