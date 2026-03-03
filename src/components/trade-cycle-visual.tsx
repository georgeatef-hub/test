'use client';

import { TradeVisualizationProps } from '@/types';

export default function TradeCycleVisual({ trade, currentUserId }: TradeVisualizationProps) {
  if (!trade.members || trade.members.length === 0) {
    return <div className="text-[#8a9a8a]">No trade data available</div>;
  }

  // For simple 2-person trade
  if (trade.members.length === 2) {
    const currentUserMember = trade.members.find(m => m.userId === currentUserId);
    const otherMember = trade.members.find(m => m.userId !== currentUserId);
    
    if (!currentUserMember || !otherMember) {
      return <div className="text-[#8a9a8a]">Trade data incomplete</div>;
    }

    return (
      <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center space-x-6">
          {/* Current User */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FF6B4A] rounded-full flex items-center justify-center text-gray-900 font-bold mb-2">
              {currentUserMember.user.name[0].toUpperCase()}
            </div>
            <div className="text-sm text-gray-900 font-medium">You</div>
            <div className="text-xs text-[#8a9a8a] mt-1">Give</div>
          </div>

          {/* Item 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#f5f5f5] rounded-lg flex items-center justify-center mb-2">
              {currentUserMember.item.images.length > 0 ? (
                <img
                  src={currentUserMember.item.images[0]}
                  alt={currentUserMember.item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div className="text-xs text-gray-900 font-medium max-w-16 truncate">
              {currentUserMember.item.title}
            </div>
          </div>

          {/* Arrow */}
          <div className="text-[#FF6B4A] text-2xl">→</div>

          {/* Other User */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FF6B4A] rounded-full flex items-center justify-center text-gray-900 font-bold mb-2">
              {otherMember.user.name[0].toUpperCase()}
            </div>
            <div className="text-sm text-gray-900 font-medium">{otherMember.user.name}</div>
            <div className="text-xs text-[#8a9a8a] mt-1">Receives</div>
          </div>
        </div>

        {/* Reverse flow */}
        <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-[#dbdbdb]">
          {/* Other User gives */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FF6B4A] rounded-full flex items-center justify-center text-gray-900 font-bold mb-2">
              {otherMember.user.name[0].toUpperCase()}
            </div>
            <div className="text-sm text-gray-900 font-medium">{otherMember.user.name}</div>
            <div className="text-xs text-[#8a9a8a] mt-1">Give</div>
          </div>

          {/* Item 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#f5f5f5] rounded-lg flex items-center justify-center mb-2">
              {otherMember.item.images.length > 0 ? (
                <img
                  src={otherMember.item.images[0]}
                  alt={otherMember.item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div className="text-xs text-gray-900 font-medium max-w-16 truncate">
              {otherMember.item.title}
            </div>
          </div>

          {/* Arrow */}
          <div className="text-[#FF6B4A] text-2xl">→</div>

          {/* Current User receives */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FF6B4A] rounded-full flex items-center justify-center text-gray-900 font-bold mb-2">
              {currentUserMember.user.name[0].toUpperCase()}
            </div>
            <div className="text-sm text-gray-900 font-medium">You</div>
            <div className="text-xs text-[#8a9a8a] mt-1">Receive</div>
          </div>
        </div>
      </div>
    );
  }

  // For 3+ person trade cycle
  const currentUserMember = trade.members.find(m => m.userId === currentUserId);
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  return (
    <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-lg p-4 mb-4">
      <div className="relative w-80 h-80 mx-auto">
        <svg width="300" height="300" className="absolute inset-0">
          {/* Draw arrows between participants */}
          {trade.members.map((member, index) => {
            const angle = (index * 2 * Math.PI) / trade.members.length - Math.PI / 2;
            const nextIndex = (index + 1) % trade.members.length;
            const nextAngle = (nextIndex * 2 * Math.PI) / trade.members.length - Math.PI / 2;
            
            const startX = centerX + Math.cos(angle) * radius;
            const startY = centerY + Math.sin(angle) * radius;
            const endX = centerX + Math.cos(nextAngle) * radius;
            const endY = centerY + Math.sin(nextAngle) * radius;
            
            // Calculate arrow position (closer to end point)
            const arrowX = endX - Math.cos(nextAngle) * 30;
            const arrowY = endY - Math.sin(nextAngle) * 30;

            return (
              <g key={member.id}>
                {/* Arrow line */}
                <path
                  d={`M ${startX} ${startY} Q ${centerX} ${centerY} ${endX} ${endY}`}
                  stroke="#FF6B4A"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Arrow head */}
                <polygon
                  points={`${arrowX},${arrowY-5} ${arrowX+10},${arrowY} ${arrowX},${arrowY+5}`}
                  fill="#FF6B4A"
                  transform={`rotate(${(nextAngle * 180) / Math.PI + 90} ${arrowX} ${arrowY})`}
                />
              </g>
            );
          })}
        </svg>

        {/* Participant circles */}
        {trade.members.map((member, index) => {
          const angle = (index * 2 * Math.PI) / trade.members.length - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const isCurrentUser = member.userId === currentUserId;

          return (
            <div
              key={member.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-gray-900 font-bold mb-2 ${
                  isCurrentUser ? 'bg-[#f59e0b]' : 'bg-[#FF6B4A]'
                }`}>
                  {member.user.name[0].toUpperCase()}
                </div>
                <div className={`text-sm font-medium ${isCurrentUser ? 'text-[#f59e0b]' : 'text-gray-900'}`}>
                  {isCurrentUser ? 'You' : member.user.name.split(' ')[0]}
                </div>
                
                {/* Item being given */}
                <div className="mt-2">
                  <div className="w-12 h-12 bg-[#f5f5f5] rounded-lg flex items-center justify-center mx-auto mb-1">
                    {member.item.images.length > 0 ? (
                      <img
                        src={member.item.images[0]}
                        alt={member.item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-lg">📦</span>
                    )}
                  </div>
                  <div className="text-xs text-[#8a9a8a] max-w-16 truncate">
                    {member.item.title}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Center explanation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg p-2 border border-[#dbdbdb]">
            <div className="text-xs text-[#8a9a8a]">{trade.members.length}-way</div>
            <div className="text-xs text-[#8a9a8a]">trade</div>
          </div>
        </div>
      </div>

      {/* Trade Summary */}
      {currentUserMember && (
        <div className="mt-4 pt-4 border-t border-[#dbdbdb] text-center">
          <div className="text-sm text-[#8a9a8a] mb-2">Your part in this trade:</div>
          <div className="text-gray-900">
            Give <span className="text-[#f59e0b] font-medium">{currentUserMember.item.title}</span> to{' '}
            <span className="text-[#FF6B4A] font-medium">{currentUserMember.receivesFromUser.name}</span>
            {' '}→{' '}
            Get <span className="text-[#FF6B4A] font-medium">{currentUserMember.receivesItem.title}</span> from{' '}
            <span className="text-[#FF6B4A] font-medium">{currentUserMember.receivesFromUser.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}