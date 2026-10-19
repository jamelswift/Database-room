import { LOCAL_MODE, assetPath } from './deployment';
import { localGameRequest } from './local-game-store';
import { RequestError } from './request-error';

export async function gameRequest(body?: any) {
  if (LOCAL_MODE) return localGameRequest(body);
  const response = await fetch(assetPath('/api/game'), body ? {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  } : { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new RequestError(data.error || 'ไม่สามารถเชื่อมต่อได้', response.status);
  return data;
}

export async function teacherReport(signal?: AbortSignal) {
  const response = await fetch(assetPath('/api/teacher'), { cache: 'no-store', signal });
  const data = await response.json();
  if (!response.ok) throw new RequestError(data.error || 'โหลดข้อมูลนักเรียนไม่ได้', response.status);
  return data;
}
