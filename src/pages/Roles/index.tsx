import Lucide from "@/components/Base/Lucide";
import { JSX } from "react";
import { FormInput } from "@/components/Base/Form";
// import users from "@/fakers/users";

// interface TableData {
//   sno: number;
//   role: string;
//   created_by: string;
//   created_at: string;
//   updated_at: string;
//   action: string;
//   id: string;
// }
import Modal from "../../components/Modal/modal";
import { useState,useRef } from "react";
import CustomTable from "@/components/TableComponent";
function Main(): JSX.Element {
    const [newUserModal, setNewUserModal] = useState(false);
    const[editModal, setEditModal] = useState<string>("")
    const [title] = useState("Add Roles")
    const userRef = useRef(null);
    const userModal = (): void => {
      setNewUserModal(!newUserModal)
    }
    const tableHeaders: string[] = [
      "sno",
      "role",
      "created_by",
      "created_at",
      "updated_at",
      "action"
    ];    

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col md:h-10 mt-4 gap-y-3 md:items-center md:flex-row">
        <div className="text-base font-medium group-[.mode--light]:text-white">
        <div className="text-base font-medium group-[.mode--light]:text-white">
         Roles
          </div>
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
                // data={users.fakeUsers() as unknown as TableData[]} 
                title={"Roles"} 
                setEditModal={setEditModal}
                editModal={editModal as string}
                status={[]} 
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
