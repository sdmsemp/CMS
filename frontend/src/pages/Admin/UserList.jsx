import React from 'react';
import Table from '../../components/Table';

const UserList = ({ users }) => (
  <Table data={users} columns={["Name", "Email", "Role"]} />
);

export default UserList;
