import { ICreatePromodoDTO } from "@/app/(front)/model/DTO/promodo.DTO";
import { useMutation } from "@tanstack/react-query";
import { ApiErrorResponse } from "../apiErrorResponse.type";
import { AxiosError } from "axios";
import { promodoApi } from "../../api/promodo/promodo.api";

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (data: ICreatePromodoDTO) => promodoApi.create(data),
    onSuccess: (_response, variables) => {},
    onError: (error: AxiosError<ApiErrorResponse>) => {},
  });
};
