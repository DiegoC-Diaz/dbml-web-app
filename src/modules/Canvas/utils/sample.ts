export const SAMPLE_DBML = `Table users {
  id int [pk, increment]
  email varchar [unique, not null]
  name varchar
  created_at timestamp
}

Table posts {
  id int [pk, increment]
  user_id int [not null]
  title varchar [not null]
  body text
}

Table comments {
  id int [pk, increment]
  post_id int [not null]
  user_id int [not null]
  body text
}

Ref: posts.user_id > users.id
Ref: comments.post_id > posts.id
Ref: comments.user_id > users.id
`;
