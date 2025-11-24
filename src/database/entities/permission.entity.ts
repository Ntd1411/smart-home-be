import { Column, Entity, ManyToMany } from "typeorm";
import { RoleEntity } from "./role.entity";
import { AuditableEntity } from "../base/base.entity";

@Entity("permissions")
export class PermissionEntity extends AuditableEntity {

  // name
  @Column({
    comment: "tên quyền",
    unique: true,
  })
  name: string;

  // description
  @Column({
    comment: "mô tả quyền",
    type: "text",
    default: "",
  })
  description: string;

  // module
  @Column({
    comment: "tên module áp dụng (ví dụ: user, role, course...)",
    length: 100,
  })
  module: string;

  // path
  @Column({
    comment: "đường dẫn API",
    length: 255,
  })
  path: string;

  // method
  @Column({
    comment: "phương thức HTTP (GET, POST, PUT, DELETE...)",
    length: 20,
  })
  method: string;


  // Many to many to Role
  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[]
}


