import { useState } from 'react';
import JsonBrowser from "Frontend/components/json/JsonBrowser.js";

export default function MainView() {
  const [name, setName] = useState('');

  return (
    <section style={{width: '100%', height: '100%'}} className="flex">
      <JsonBrowser/>
    </section>
  );
}
