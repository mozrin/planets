FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json ./package.json
COPY website/package.json ./website/package.json
RUN npm install --workspace website --include-workspace-root

FROM dependencies AS development
WORKDIR /app
COPY website ./website
COPY docs ./docs
WORKDIR /app/website
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM dependencies AS build
COPY website ./website
COPY docs ./docs
WORKDIR /app/website
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app
COPY --from=build /app/website/dist ./dist
USER node
CMD ["node", "-e", "const {createServer}=require('node:http');const{readFile,stat}=require('node:fs/promises');const{join,extname}=require('node:path');const root='/app/dist';const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.md':'text/markdown','.svg':'image/svg+xml'};createServer(async(q,s)=>{try{let p=join(root,q.url.split('?')[0]);if(q.url==='/'||(await stat(p)).isDirectory())p=join(root,'index.html');s.writeHead(200,{'content-type':types[extname(p)]||'application/octet-stream'});s.end(await readFile(p))}catch{s.writeHead(404);s.end('Not found')}}).listen(3000,'0.0.0.0')"]
