
const SUPABASE_URL = "https://fsudquiewxlktggtkyia.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lp_Kgg0F012kzLDqHfcQvg_vg-pt-uV";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Lightweight logging wrappers for debugging DB requests/responses
(function attachSupabaseLogging() {
  try {
    const client = window.supabaseClient;
    if (!client) return;

    const originalFrom = client.from.bind(client);
    client.from = function (table) {
      const builder = originalFrom(table);

      ["select", "insert", "update", "delete", "upsert", "rpc"].forEach(
        (m) => {
          if (typeof builder[m] === "function") {
            const orig = builder[m].bind(builder);
            builder[m] = function (...args) {
              console.log(`[Supabase] Request ${m} -> ${table}`, ...args);
              return orig(...args);
            };
          }
        }
      );

      // Log responses when the builder resolves (supabase-js uses thenable builders)
      if (typeof builder.then === "function") {
        const origThen = builder.then.bind(builder);
        builder.then = function (onFulfilled, onRejected) {
          return origThen(
            (res) => {
              console.log(`[Supabase] Response <- ${table}`, res);
              return onFulfilled ? onFulfilled(res) : res;
            },
            (err) => {
              console.error(`[Supabase] Error <- ${table}`, err);
              return onRejected ? onRejected(err) : Promise.reject(err);
            }
          );
        };
      }

      return builder;
    };

    // Wrap auth methods to log calls/results
    if (client.auth) {
      Object.keys(client.auth).forEach((k) => {
        const val = client.auth[k];
        if (typeof val === "function") {
          client.auth[k] = function (...args) {
            console.log(`[Supabase][auth] call ${k}`, ...args);
            const res = val.apply(client.auth, args);
            if (res && typeof res.then === "function") {
              return res.then(r => { console.log(`[Supabase][auth] result ${k}`, r); return r; });
            }
            console.log(`[Supabase][auth] result ${k}`, res);
            return res;
          };
        }
      });
    }
  } catch (e) {
    console.warn("Could not attach Supabase logging", e);
  }
})();