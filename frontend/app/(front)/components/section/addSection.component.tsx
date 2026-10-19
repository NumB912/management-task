import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ISectionModel } from "../../model";
import InputText from "./inputSection.component";
interface AddSectionProp {
  listId:string,
  handleAddSection:(section:Pick<ISectionModel, 'name'>)=>void
}
const AddSection = ({handleAddSection }: AddSectionProp) => {
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [newSectionName, setNewSectionName] = useState<string>("");
  const handleCreateSection = useCallback(() => {
    const trimmed = newSectionName.trim();
    if(trimmed!==""){
      handleAddSection({name:trimmed})
    }
    setIsCreate(false);
    setNewSectionName("");
  }, [newSectionName,handleAddSection]);

  function handleSectionClose() {
    setIsCreate(false);
    setNewSectionName("");
  }

  return (
    <div className="min-w-80 p-2">
      {isCreate ? (
        <InputText
          doneHandle={handleCreateSection}
          closeHandle={handleSectionClose}
          setValue={setNewSectionName}
          value={newSectionName}
          placeholder="Tạo thêm phần"
        />
      ) : (
        <Button variant={"ghost"}
          onClick={() => setIsCreate(true)}
          className="text-primary hover:text-primary! cursor-pointer w-fit min-w-40 rounded-md flex gap-1 items-center "
        >
          <Plus className="w-4 h-4"/>
          <span>Thêm thanh</span>
        </Button>
      )}
    </div>
  );
};

export default AddSection;