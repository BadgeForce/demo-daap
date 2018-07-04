import { toast } from "react-toastify";

export class Toaster {
     
    static notify(message, type) {
        const id = toast(message, { autoClose: 15000, type, position: toast.POSITION.TOP_RIGHT });
        return id;
    }

    static update(id, message, type) {
        toast.update(id, {render: message, type, autoClose: 15000});
    }
}