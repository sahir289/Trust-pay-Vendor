import Lucide from "@/components/Base/Lucide";
import {  FormInput } from "@/components/Base/Form";
// import users from "@/fakers/users";
import Modal from "../../components/Modal/modal";
import { useState, useRef } from "react";
import CustomTable from "@/components/TableComponent";
import React from "react";
export interface User {
  sno: number;
  code: string;
  vendor_commission: number;
  created_date: string;
  created_by: string;
  status: string;
  action: string;
  id: string;
  updated_at: string;
}
const Main: React.FC = () => {
    const [newUserModal, setNewUserModal] = useState<boolean>(false);
    const[editModal, setEditModal] = useState<string>("designation")
    const [title] = useState<string>("Designation");
    const userRef = useRef< null>(null);
    const userModal = (): void => {
      setNewUserModal(!newUserModal)
    }
const tableHeaders: string[] = [
  "Designation",
  "Role",
  "Created_By",
  "Created_At",
  "Updated_at",   
  "Action"
];
  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12 ">
        <div className="flex flex-col mt-4 md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            Designation
          </div>
 <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
  <Modal handleModal={userModal} sendButtonRef={userRef} forOpen={newUserModal} title={title} />
          </div>
        </div>
              <div className="flex flex-col gap-8 mt-3.5">
          
          <div className="flex flex-col box box--stacked">
            <div className="flex flex-col p-5 sm:items-center sm:flex-row gap-y-2">
              <div>
                <div className="relative">
                  <Lucide
                    icon="Search"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3] text-slate-500"
                  />
                  <FormInput
                    type="text"
                    placeholder="Search..."
                    className="pl-9 sm:w-64 rounded-[0.5rem]"
                  />
                </div>
              </div>
             
            </div>
              <CustomTable 
                columns={tableHeaders} 
                // data={users.fakeUsers() as unknown as User[]} 
                title={"Designation"}  
                status={[]} 
                setEditModal={setEditModal}
                editModal={editModal}
                setStatus={() => {}} 
                setParams={() => {}}
                approve={false} 
                setApprove={() => {}} 
                reject={false} 
                setReject={() => {}} 
              />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
