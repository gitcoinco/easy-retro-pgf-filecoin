import { z } from "zod";
import { Form, FormControl, Input } from "~/components/ui/Form";
import { useAddPoolManager, useIsPoolAdmin } from "../hooks/useAlloPool";
import { Button } from "~/components/ui/Button";
import { EthAddressSchema } from "../types";
import { Dialog } from "~/components/ui/Dialog";
import { useState } from "react";

export function AddPoolManager({ poolId = 0 }) {
  const { data: isPoolAdmin } = useIsPoolAdmin(poolId);
  const add = useAddPoolManager();
  const [isOpen, setOpen] = useState(false);
  if (!poolId || !isPoolAdmin) return null;

  return (
    <>
      <Button className={"w-full"} onClick={() => setOpen(true)}>
        Add PoolManager
      </Button>
      <Dialog title="Add pool manager" isOpen={isOpen} onOpenChange={setOpen}>
        <Form
          schema={z.object({
            address: EthAddressSchema,
          })}
          onSubmit={({ address }) => {
            add.mutate({ poolId, address });
          }}
        >
          <div className="gap-2">
            <FormControl name="address" label="Address of new pool manager">
              <Input placeholder="0x..." />
            </FormControl>
            <Button
              variant="primary"
              type="submit"
              className="w-full"
              disabled={add.isPending}
            >
              Add PoolManager
            </Button>
          </div>
        </Form>
      </Dialog>
    </>
  );
}
