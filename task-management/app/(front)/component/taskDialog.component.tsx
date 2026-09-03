// "use client";
// import { Dialog, DialogContent } from "@/app/(front)/components/ui/dialog";
// import React, { useState } from "react";
// import { Task, TaskCheckbox } from "../components/taskCard.component";
// import TaskModel from "../model/task.model";
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
// import CalendarComponent from "../components/calendar/calendar.component";
// import mockTags from "../mocks/tag.mocks";
// import { Check } from "lucide-react";
// import { ITag } from "../../core/domain";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/app/(front)/components/ui/dropdown-menu";
// import { Textarea } from "@/app/(front)/components/ui/textarea";

// interface TaskDialogProp {
//   data: TaskModel;
// }

// const TaskDialog = ({ data }: TaskDialogProp) => {
//   const router = useRouter();
//   const [task, setTask] = useState<TaskModel>(data);
//   const [openpriority, setOpenpriority] = useState<boolean>(false);
//   const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
//   const [priority, setPriority] = useState<string>(
//     task.rule?.priority?.toString() || "1",
//   );

//   const handleDescriptionChange = (
//     event: React.ChangeEvent<HTMLTextAreaElement>,
//   ) => {
//     const nextDescription = event.target.value;
//     setTask((prev) => ({ ...prev, description: nextDescription }));
//   };

//   const handleDescriptionKeyDown = (
//     event: React.KeyboardEvent<HTMLTextAreaElement>,
//   ) => {
//     if (event.key !== "Enter") {
//       return;
//     }
//     const textarea = event.currentTarget;
//     setTask((prev) => ({ ...prev, description: textarea.value }));

//   };
//   const [startDate, setStartDate] = useState<string>(
//     data.rule.start_date || "",
//   );
//   const [endDate, setEndDate] = useState<string>(data.rule.end_date || "");
//   const [selectedTags, setSelectedTags] = useState<ITag[]>(
//     data.rule.tags || [],
//   );
//   const [tagSearch, setTagSearch] = useState("");
//   const isTagSelected = (tag: ITag) =>
//     selectedTags.some((t) => t.id === tag.id);
//   const selectedTagItems = mockTags.filter((tag) => isTagSelected(tag));
//   const toggleTag = (tag: ITag) => {
//     setSelectedTags((prev) =>
//       isTagSelected(tag) ? prev.filter((t) => t.id !== tag.id) : [...prev, tag],
//     );
//   };

//   const handleAddTag = (tag: ITag) => {
//     if (!isTagSelected(tag)) {
//       setSelectedTags((prev) => [...prev, tag]);
//     }
//   };

//   const handleDescriptionFocus = () => {
//     setIsDescriptionEditing(true);
//   };

//   const handleDescriptionCancel = () => {
//     setTask((prev) => ({ ...prev, description: data.description || "" }));
//     setIsDescriptionEditing(false);
//   };

//   const handleDescriptionSave = () => {
//     setIsDescriptionEditing(false);
//   };

//   return (
//     <Dialog
//       defaultOpen={true}
//       onOpenChange={(open) => {
//         if (!open) {
//           router.back();
//         }
//       }}
//     >
//       <DialogContent className="w-[95vw] max-w-5xl p-0 min-h-96">
//         <div className="flex h-full flex-col gap-2 lg:flex-row">
//           <div className="w-full p-6 sm:p-8 lg:min-w-md lg:p-10">
//             <div className="w-full flex flex-col gap-2 p-2">
//               <div className="flex items-center font-bold gap-2">
//                 <TaskCheckbox checked={data.checked} onHandle={() => {}} />
//                 <div className="text-xl">{data.name}</div>
//               </div>

//               <div className="ml-10">
//                 <Textarea
//                   className="min-h-10 focus:border-none focus:outline"
//                   placeholder="Chi tiết task người dùng"
//                   value={task.description || ""}
//                   onChange={handleDescriptionChange}
//                   onKeyDown={handleDescriptionKeyDown}
//                   onFocus={handleDescriptionFocus}
//                 />
//                 {isDescriptionEditing && (
//                   <div className="mt-2 flex gap-2 w-full justify-end">
//                     <Button
//                       type="button"
//                       size="sm"
//                       onClick={handleDescriptionSave}
//                     >
//                       Lưu
//                     </Button>
//                     <Button
//                       type="button"
//                       size="sm"
//                       variant="outline"
//                       onClick={handleDescriptionCancel}
//                     >
//                       Hủy
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="children">
//               {data.childrenTask?.map((task) => {
//                 return <Task depth={1} task={task} key={task.id} />;
//               })}
//             </div>
//           </div>

//           <div className="flex w-full flex-col gap-4 bg-pink-50/20 p-6 pb-3 sm:p-8 lg:max-w-md lg:p-10 lg:min-h-lg">
//             <div className="w-full">
//               <Field>
//                 <FieldLabel htmlFor="priority" className="font-bold">
//                   Độ ưu tiên
//                 </FieldLabel>
//                 <Select
//                   open={openpriority}
//                   onOpenChange={setOpenpriority}
//                   value={priority}
//                   onValueChange={setPriority}
//                 >
//                   <SelectTrigger className="bg-white">
//                     {priority === "1" && "🔵 Thấp"}
//                     {priority === "2" && "🟡 Vừa"}
//                     {priority === "3" && "🟠 Cao"}
//                     {priority === "4" && "🔴 Rất Cao"}
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="1">🔵 Thấp (1)</SelectItem>
//                     <SelectItem value="2">🟡 Vừa (2)</SelectItem>
//                     <SelectItem value="3">🟠 Cao (3)</SelectItem>
//                     <SelectItem value="4">🔴 Rất Cao (4)</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FieldDescription>
//                   Mức độ ưu tiên của công việc
//                 </FieldDescription>
//               </Field>
//             </div>

//             <div className="w-full">
//               <Field>
//                 <FieldLabel htmlFor="startDate" className="font-bold">
//                   Ngày bắt đầu và kết thúc
//                 </FieldLabel>
//                 <CalendarComponent
//                   rule={data.rule}
//                   trigger={
//                     <Button
//                       variant="outline"
//                       className="w-full justify-between cursor-pointer"
//                     >
//                       <span>
//                         {data.rule.start_date
//                           ? "Từ ngày: " + data.rule.start_date
//                           : "Chọn ngày bắt đầu"}
//                       </span>
//                       <span>📅</span>
//                     </Button>
//                   }
//                 />
//                 <FieldDescription>
//                   Ngày bắt đầu và kết thúc công việc
//                 </FieldDescription>
//               </Field>
//             </div>

//             <div className="h-fit">
//               <Field>
//                 <FieldLabel htmlFor="tags" className="font-bold">
//                   Tag
//                 </FieldLabel>
//                 <div className="group flex flex-wrap items-center gap-2">
//                   {selectedTagItems.map((tag) => (
//                     <Button
//                       key={tag.id}
//                       variant={"outline"}
//                       className="inline-flex items-center rounded-full border px-3 py-1 text-sm "
//                     >
//                       <button
//                         type="button"
//                         onClick={() => {
//                           router.replace(`/dashboard/work/tag/${tag.id}`);
//                         }}
//                         className="flex items-center"
//                       >
//                         <span>{tag.name}</span>
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => toggleTag(tag)}
//                         className="flex z-10 items-center justify-center rounded-full text-xs cursor-pointer hover:bg-white/20"
//                         aria-label={`Xóa tag ${tag.name}`}
//                       >
//                         ×
//                       </button>
//                     </Button>
//                   ))}

//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant={"outline"}
//                         type="button"
//                         className="cursor-pointer flex items-center justify-center rounded-full border border-dashed border-pink-300 bg-white text-lg text-pink-500"
//                         aria-label="Thêm tag"
//                       >
//                         +
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="start" className="w-64 p-2">
//                       <Input
//                         value={tagSearch}
//                         onChange={(e) => setTagSearch(e.target.value)}
//                         placeholder="Tìm tag..."
//                         className="mb-2"
//                       />
//                       <div className="max-h-40 overflow-y-auto">
//                         {mockTags
//                           .filter((tag) =>
//                             tag.name
//                               .toLowerCase()
//                               .includes(tagSearch.toLowerCase()),
//                           )
//                           .map((tag) => {
//                             const isSelected = selectedTags.some(
//                               (tagS) => tagS.id === tag.id,
//                             );
//                             return (
//                               <button
//                                 key={tag.id}
//                                 type="button"
//                                 onClick={() => {
//                                   if (isSelected) {
//                                     toggleTag(tag);
//                                   } else {
//                                     handleAddTag(tag);
//                                   }
//                                 }}
//                                 className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-pink-50"
//                               >
//                                 <span>{tag.name}</span>
//                                 <span
//                                   className={`flex h-4 w-4 items-center justify-center rounded border ${
//                                     isSelected
//                                       ? "border-pink-500 bg-pink-500"
//                                       : "border-gray-300"
//                                   }`}
//                                 >
//                                   {isSelected && (
//                                     <Check size={12} className="text-white" />
//                                   )}
//                                 </span>
//                               </button>
//                             );
//                           })}
//                         {mockTags.filter((tag) =>
//                           tag.name
//                             .toLowerCase()
//                             .includes(tagSearch.toLowerCase()),
//                         ).length === 0 && (
//                           <div className="px-3 py-2 text-sm text-gray-500">
//                             Không tìm thấy tag phù hợp.
//                           </div>
//                         )}
//                       </div>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>

//                 <FieldDescription>
//                   Tag để phân chia tìm kiếm task dễ dàng hơn
//                 </FieldDescription>
//               </Field>
//             </div>

//             <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//               <Button
//                 className="cursor-pointer"
//                 onClick={() => {
//                   router.back();
//                 }}
//                 variant={"outline"}
//               >
//                 Hủy
//               </Button>
//               <Button
//                 className="cursor-pointer"
//                 onClick={() => {}}
//                 variant={"default"}
//               >
//                 Chỉnh sửa
//               </Button>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default TaskDialog;
