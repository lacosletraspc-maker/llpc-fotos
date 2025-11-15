
(function () {
  "use strict";
  var container = document.getElementById("lista-temas");
  if (!container) return;

  function asArray(obj, key) {
    if (Array.isArray(obj)) return obj;
    if (obj && key && Array.isArray(obj[key])) return obj[key];
    return [];
  }

  fetch("catalogo/index.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (dados) {
      var temas = asArray(dados, "temas");
      if (!temas.length) {
        container.innerHTML =
          '<p class="col-span-full text-center text-gray-500 text-sm">Nenhum tema publicado ainda.</p>';
        return;
      }

      container.innerHTML = temas
        .map(function (item) {
          var slug = (item.slug || "").toString();
          var tema = item.tema || item.nome || "Tema";
          var total = item.total != null ? item.total : "";
          var foto = item.thumb || item.capa || item.hero || "";
          var linkTema = "lp-tema.html?slug=" + encodeURIComponent(slug);

          var fotosTexto =
            total !== "" ? total + " fotos no catálogo" : "Veja todas as fotos do tema";

          var imgHtml = "";
          if (foto) {
            imgHtml =
              '<img src="' +
              foto +
              '" alt="' +
              tema.replace(/"/g, "&quot;") +
              '" class="w-full h-48 object-cover">';
          }

          return (
            '<a href="' +
            linkTema +
            '" class="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-emerald-500">' +
            imgHtml +
            '<div class="p-4 flex flex-col gap-2">' +
            '<h2 class="font-semibold text-lg text-emerald-700 truncate">' +
            tema +
            "</h2>" +
            '<p class="text-sm text-gray-600">' +
            fotosTexto +
            "</p>" +
            '<p class="text-xs text-gray-500 mt-1">Clique em qualquer lugar deste card para ver kits, linhas (Essencial ao Luxo) e falar com a Lale ✨.</p>' +
            "</div>" +
            "</a>"
          );
        })
        .join("");
    })
    .catch(function (err) {
      console.error(err);
      container.innerHTML =
        '<p class="col-span-full text-center text-red-600 text-sm">Erro ao carregar o catálogo. Tente novamente em alguns instantes.</p>';
    });
})();