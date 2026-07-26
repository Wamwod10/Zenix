import { useState } from "react";
import { Send } from "lucide-react";

import { formatEmployeeName } from "../../utils/hrFormatters";

const Messages = ({ controller }) => {
  const { state, dictionaries } = controller;
  const [text, setText] = useState("");
  const [type, setType] = useState("broadcast");

  return (
    <div className="hr-view">
      <section className="hr-grid hr-grid--wide">
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Internal messages</span><h2>iMessage style chat</h2></div></div>
          <div className="hr-chat">
            {state.messages.slice(0, 8).reverse().map((message) => (
              <article key={message.id} className={message.from === "emp-003" ? "is-own" : ""}>
                <strong>{formatEmployeeName(dictionaries.employeeById[message.from])}</strong>
                <span>{message.text}</span>
                <small>{message.type} · unread {message.readBy.length === 0 ? "yes" : "no"}</small>
              </article>
            ))}
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Broadcast</span><h2>All, branch, department, selected</h2></div></div>
          <div className="hr-form-grid">
            <label>Type<select value={type} onChange={(event) => setType(event.target.value)}><option value="broadcast">All employees</option><option value="branch">Selected branch</option><option value="department">Department</option><option value="personal">Selected employee</option></select></label>
            <label className="hr-form-grid__wide">Message<textarea value={text} onChange={(event) => setText(event.target.value)} /></label>
          </div>
          <button type="button" onClick={() => { if (controller.actions.sendMessage({ text, type, to: ["all"] })) setText(""); }}>
            <Send size={15} /> Send
          </button>
        </article>
      </section>
    </div>
  );
};

export default Messages;
