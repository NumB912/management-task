// // app/component/taskDetail.component.tsx
// // Client Component — hooks ở đây
// "use client";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Field, FieldDescription, FieldLabel } from "@/app/(front)/components/ui/field";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
// } from "@/app/(front)/components/ui/select";
// import { Button } from "@/app/(front)/components/ui/button";
// import { Input } from "@/app/(front)/components/ui/input";
// import { Check, ArrowLeft } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/app/(front)/components/ui/dropdown-menu";
// import { Textarea } from "@/app/(front)/components/ui/textarea";
// import { Task, TaskCheckbox } from "@/app/(front)/components/taskCard.component";
// import CalendarComponent from "@/app/(front)/components/calendar/calendar.component";
// import { ITagModel, ITaskModel } from "../model";

// interface TaskDetailProps {
//   data: ITaskModel;
//   onSave?: (task: ITaskModel) => void;
//   onCancel?: () => void;
// }

// const TaskDetail = ({ data, onSave, onCancel }: TaskDetailProps) => {
//   const router = useRouter();
//   const [task, setTask] = useState<ITaskModel>(data);
//   const [openPriority, setOpenPriority] = useState(false);
//   const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
//   const [priority, setPriority] = useState<string>(
//     data.rule?.priority?.toString() || "1",
//   );
//   const [selectedTags, setSelectedTags] = useState<ITagModel[]>(
//   []
//   );
//   const [tagSearch, setTagSearch] = useState("");
//   const isTagSelected = (tag: ITagModel) => selectedTags.some((t) => t.id === tag.id);
//   const selectedTagItems = [].filter((tag) => isTagSelected(tag));

//   const toggleTag = (tag: ITagModel) =>
//     setSelectedTags((prev) =>
//       isTagSelected(tag) ? prev.filter((t) => t.id !== tag.id) : [...prev, tag],
//     );

//   const handleAddTag = (tag: ITagModel) => {
//     if (!isTagSelected(tag)) setSelectedTags((prev) => [...prev, tag]);
//   };

//   const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
//     setTask((prev) => ({ ...prev, description: e.target.value }));

//   const handleDescriptionSave = () => setIsDescriptionEditing(false);

//   const handleDescriptionCancel = () => {
//     setTask((prev) => ({ ...prev, description: data.description || "" }));
//     setIsDescriptionEditing(false);
//   };

//   const handleSave = () => {
//     const updatedTask: ITaskModel = {
//       ...task,
//       rule: {
//         ...task.rule,
//         priority: parseInt(priority) as 1 | 2 | 3 | 4,
//         // tags: selectedTags,
//       },
//     };

//     if (onSave) {
//       onSave(updatedTask);
//     } else {
//       router.back();
//     }
//   };

//   const handleCancel = () => {
//     onCancel ? onCancel() : router.back();
//   };

//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex flex-col justify-center gap-5 lg:flex-row">
//         <div className={`w-full h-full bg-white p-10`}>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="cursor-pointer w-fit flex items-center gap-1 text-muted-foreground hover:text-foreground p-2"
//             onClick={handleCancel}
//           >
//             <ArrowLeft size={20} />
//             <span className="text-md">Quay lại</span>
//           </Button>

//           <div className="w-full flex flex-col gap-2 p-2">
//             <div className="flex items-center font-bold gap-2">
//               <TaskCheckbox checked={task.checked} onHandle={() => {}} />
//               <div className="text-xl flex-1">{task.name}</div>
//             </div>

//             <div className="ml-10">
//               <Textarea
//                 className="min-h-10 focus:border-none focus:outline"
//                 placeholder="Chi tiết task người dùng"
//                 value={task.description || ""}
//                 onChange={handleDescriptionChange}
//                 onFocus={() => setIsDescriptionEditing(true)}
//               />
//               {isDescriptionEditing && (
//                 <div className="mt-2 flex gap-2 w-full justify-end">
//                   <Button size="sm" onClick={handleDescriptionSave}>
//                     Lưu
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={handleDescriptionCancel}
//                   >
//                     Hủy
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="children">
//             {task.children?.map((child) => (
//               <Task depth={1} task={child} key={child.id} />
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default TaskDetail;
