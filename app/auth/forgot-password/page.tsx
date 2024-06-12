"use client";

import { useFormik, Form, FormikProvider, getIn } from "formik";

import * as yup from "yup";
import { LupaPasswordPayload } from "../interface";
import InputText from "@/components/InputText";
import Label from "@/components/Label";
import Button from "@/components/Button";
import useAuthModule from "../lib";
import Link from "next/link";

export const lupaPwSchema = yup.object().shape({
  email: yup
    .string()
    .nullable()
    .default("")
    .email("Gunakan format email")
    .required("tolong isi terlebih dahulu"),
});

const LupaPw = ({ params }: any) => {
  const { useLupaPassword } = useAuthModule();
  const { mutate, isLoading } = useLupaPassword();
  const formik = useFormik<LupaPasswordPayload>({
    initialValues: lupaPwSchema.getDefault(),
    validationSchema: lupaPwSchema,
    enableReinitialize: true,
    onSubmit: (payload) => {
      mutate(payload);
    },
  });
  const { handleChange, handleSubmit, handleBlur, values, errors } = formik;

  return (
    <FormikProvider value={formik}>
      <section className="mt-10 flex justify-center items-center">
        <Form
          className="space-y-8 bg-white border border-grey-200 w-[500px] rounded-lg p-10"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-center w-full">
            <h1 className="text-2xl font-bold text-gray-800">
              Forgot Password
            </h1>
          </div>
          <section>
            <Label htmlFor="email" title="Email" />
            <InputText
              value={values.email}
              placeholder="exampel@email.com"
              id="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              isError={getIn(errors, "email")}
              messageError={getIn(errors, "email")}
            />
          </section>
          <section className="flex flex-col gap-3">
            <Button
              width="login"
              title="Send Email"
              colorSchema="dark"
              isLoading={isLoading}
              isDisabled={isLoading}
            />
            <Link href={"/login"}>
              <Button title="Back" colorSchema="blue" width="login" />
            </Link>
          </section>
        </Form>
      </section>
    </FormikProvider>
  );
};

export default LupaPw;
